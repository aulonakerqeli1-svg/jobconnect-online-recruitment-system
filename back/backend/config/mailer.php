<?php
// ============================================
// mailer.php - Dërgimi i njoftimeve me email
//
// Përdor funksionin e brendshëm mail() të PHP-së.
// Në localhost/XAMPP, mail() ZAKONISHT s'dërgon vërtet email pa
// konfigurim SMTP (shiko shënimin poshtë). Për zhvillim, mund ta
// lësh kështu — çdo tentativë regjistrohet me error_log() që ta
// shohësh në terminal/log edhe nëse email-i real s'shkon.
// ============================================

function sendApplicationStatusEmail($toEmail, $toName, $jobTitle, $companyName, $status) {
    $statusText = $status === 'accepted' ? 'U PRANUA' : 'U REFUZUA';

    $subject = "JobConnect - Aplikimi juaj për \"$jobTitle\" $statusText";

    $body = "Përshëndetje $toName,\n\n";
    if ($status === 'accepted') {
        $body .= "Kemi kënaqësinë t'ju njoftojmë se aplikimi juaj për pozitën \"$jobTitle\" te $companyName është PRANUAR.\n";
        $body .= "Kompania do t'ju kontaktojë së shpejti për hapat e mëtejshëm.\n";
    } else {
        $body .= "Ju falenderojmë për interesimin për pozitën \"$jobTitle\" te $companyName.\n";
        $body .= "Fatkeqësisht, këtë herë aplikimi juaj nuk u pranua.\n";
    }
    $body .= "\nMe respekt,\nEkipi i JobConnect";

    $headers = "From: no-reply@jobconnect.local\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $sent = @mail($toEmail, $subject, $body, $headers);

    if (!$sent) {
        // Regjistro në log që të mund ta verifikosh gjatë zhvillimit
        error_log("[JobConnect] Email s'u dërgua (kontrollo konfigurimin SMTP) -> $toEmail: $subject");
    }

    return $sent;
}

// ============================================
// Email mirëseardhjeje pas regjistrimit të suksesshëm
// ============================================
function sendWelcomeEmail($toEmail, $toName, $role) {
    $roleText = $role === 'company' ? 'kompani' : 'kandidat';

    $subject = "Mirë se erdhe në JobConnect!";

    $body = "Përshëndetje $toName,\n\n";
    $body .= "Regjistrimi juaj në JobConnect u krye me sukses, si $roleText.\n\n";

    if ($role === 'company') {
        $body .= "Tani mund të kyçeni dhe të krijoni shpalljet e para të punës. Çdo shpallje kalon\n";
        $body .= "fillimisht nëpër miratim nga administratori, para se t'u shfaqet kandidatëve.\n";
    } else {
        $body .= "Tani mund të kyçeni, të plotësoni profilin tuaj (telefon, aftësi, eksperiencë),\n";
        $body .= "dhe të aplikoni për shpalljet e disponueshme.\n";
    }

    $body .= "\nMe respekt,\nEkipi i JobConnect";

    $headers = "From: no-reply@jobconnect.local\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $sent = @mail($toEmail, $subject, $body, $headers);

    if (!$sent) {
        error_log("[JobConnect] Email mirëseardhjeje s'u dërgua -> $toEmail: $subject");
    }

    return $sent;
}
