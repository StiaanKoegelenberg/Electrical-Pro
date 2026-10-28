<?php
// Emails enquiries from the website's contact form (src/components/site/ContactSection.tsx) to the
// office. PHP only runs on the live hosting, so test the form there after each upload.

// Where enquiries go. It's also the sender, since the mail server only sends as addresses on this
// domain; Reply-To is the customer, so hitting reply answers them directly.
const TO = 'info@electricalpro.co.za';
const SERVICES = ['EP Solar', 'Commercial', 'Agricultural', 'Residential', 'Other / Not sure'];

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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405);
}

// People never see this field, but spam bots fill in everything: act as if it worked and drop it
if (field('website', 200) !== '') {
    reply(200);
}

$name = field('name', 100);
$phone = field('phone', 40);
$email = field('email', 200);
$service = in_array($_POST['service'] ?? null, SERVICES, true) ? $_POST['service'] : 'Other / Not sure';
$message = is_string($_POST['message'] ?? null) ? trim(substr($_POST['message'], 0, 5000)) : '';

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(400);
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
