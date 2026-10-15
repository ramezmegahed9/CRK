<?php
require __DIR__ . '/config.php';
if (is_logged_in()) { header('Location: dashboard.php'); exit; }

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $_SESSION['tries'] = ($_SESSION['tries'] ?? 0) + 1;
  if ($_SESSION['tries'] > 5) sleep(min(10, $_SESSION['tries'] - 5)); // slow down brute force
  $u = trim($_POST['username'] ?? '');
  $p = (string)($_POST['password'] ?? '');
  if (hash_equals(APP_USER, $u) && password_verify($p, APP_PASS_HASH)) {
    session_regenerate_id(true);
    $_SESSION['crk_user'] = $u;
    $_SESSION['tries'] = 0;
    header('Location: dashboard.php'); exit;
  }
  $error = 'Wrong username or password.';
}
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Crackwits · Lead Engine</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/app.css">
</head>
<body class="login">
  <main class="login-card">
    <div class="brand"><span class="mark">CW</span><div><b>Crackwits</b><small>Lead Engine</small></div></div>
    <h1>Welcome back</h1>
    <p class="muted">Daily, research-backed prospects for Kuwait &amp; Lebanon.</p>
    <?php if ($error): ?><div class="alert"><?= h($error) ?></div><?php endif; ?>
    <form method="post" autocomplete="on">
      <label>Username<input name="username" required autofocus autocomplete="username"></label>
      <label>Password<input name="password" type="password" required autocomplete="current-password"></label>
      <button class="btn primary" type="submit">Sign in</button>
    </form>
  </main>
</body>
</html>
