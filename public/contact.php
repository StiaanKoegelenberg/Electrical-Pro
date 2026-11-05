<?php
// Emails enquiries from the website's contact form (src/components/site/ContactSection.tsx) to the
// office. PHP only runs on the live hosting, so test the form there after each upload.

// Where enquiries go. It's also the sender, since the mail server only sends as addresses on this
// domain; Reply-To is the customer, so hitting reply answers them directly.
const TO = 'info@electricalpro.co.za';
const SERVICES = ['EP Solar', 'Commercial', 'Agricultural', 'Residential', 'Other'];

// Spam checks, besides the hidden field below. The page sends how long ago (in ms) the visitor first went
// into the form: anything sent sooner than MIN_FILL_MS after that is a bot (people take longer to fill
// it in), and so is anything sent without it (posted straight here rather than through the page). And at
// most LIMIT enquiries every WINDOW seconds go through from one connection, so a bot can't flood the
// inbox. Both get the form's "didn't send" message, so a person who somehow trips one is told to phone
// or email instead of being lost.
const MIN_FILL_MS = 3000;
const LIMIT = 3;
const WINDOW = 600;

header('Content-Type: application/json');

function reply(int $status): void
{
    http_response_code($status);
    echo json_encode(['ok' => $status === 200]);
    exit;
}

// One line of text, so nothing typed into the form can add mail headers
function field(string $key, int $maxLength): string
{
    $value = $_POST[$key] ?? '';
    return is_string($value) ? trim(substr(str_replace(["\r", "\n"], ' ', $value), 0, $maxLength)) : '';
}

// Counts this enquiry against its connection's limit (see LIMIT) and says whether it's over. The counts
// live in a small file in the server's temporary folder, under a hash of each address rather than the
// address itself, and only for WINDOW seconds. If that file can't be opened the enquiry goes through:
// better a little spam than a lost customer. Behind a proxy such as Cloudflare every visitor would share
// the proxy's address, so the visitor's own would have to come from its header (CF-Connecting-IP).
function overLimit(): bool
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $file = sys_get_temp_dir() . '/electricalpro-enquiries-' . md5(__DIR__) . '.json';
    $handle = $ip === '' ? false : @fopen($file, 'c+');
    if (!$handle) {
        return false;
    }
    flock($handle, LOCK_EX);
    $now = time();
    $counts = json_decode(stream_get_contents($handle), true);
    $counts = is_array($counts) ? $counts : [];
    // Forget enquiries older than the window, and connections with none left
    foreach ($counts as $key => $times) {
        $recent = array_values(array_filter((array) $times, function ($t) use ($now) {
            return is_int($t) && $t > $now - WINDOW;
        }));
        if ($recent) {
            $counts[$key] = $recent;
        } else {
            unset($counts[$key]);
        }
    }
    $key = hash('sha256', $ip . __DIR__);
    $over = count($counts[$key] ?? []) >= LIMIT;
    if (!$over) {
        $counts[$key][] = $now;
    }
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($counts));
    flock($handle, LOCK_UN);
    fclose($handle);
    return $over;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405);
}

// People never see this field, but spam bots fill in everything: act as if it worked and drop it
if (field('website', 200) !== '') {
    reply(200);
}

// Sent too soon after the form was opened, or not through the page at all (see MIN_FILL_MS)
$elapsed = filter_var($_POST['elapsed'] ?? '', FILTER_VALIDATE_INT);
if ($elapsed === false || $elapsed < MIN_FILL_MS) {
    reply(400);
}

$name = field('name', 100);
$phone = field('phone', 40);
$email = field('email', 200);
$service = in_array($_POST['service'] ?? null, SERVICES, true) ? $_POST['service'] : 'Other';
$message = is_string($_POST['message'] ?? null) ? trim(substr($_POST['message'], 0, 5000)) : '';

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(400);
}

if (overLimit()) {
    reply(429);
}

$subject = "Website enquiry: $service - $name";
$body = "Name: $name\nPhone: " . ($phone !== '' ? $phone : '-') . "\nEmail: $email\nService: $service\n\n$message\n";
$headers = implode("\r\n", [
    'From: Electrical Pro website <' . TO . '>',
    "Reply-To: $email",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = mail(TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . TO);
reply($sent ? 200 : 500);
