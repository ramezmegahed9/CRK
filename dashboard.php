<?php
require __DIR__ . '/config.php';
require_login();
$data  = load_json(LEADS_FILE, ['updated' => '', 'leads' => []]);
$state = load_json(STATE_FILE, []);
$leads = $data['leads'] ?? [];
foreach ($leads as &$l) {
  $s = $state[$l['id']] ?? [];
  $l['status'] = $s['status'] ?? 'new';
  $l['note']   = $s['note'] ?? '';
}
unset($l);
usort($leads, fn($a, $b) => [$b['added'], $b['score']] <=> [$a['added'], $a['score']]);
$payload = json_encode(['leads' => $leads, 'updated' => $data['updated'] ?? '', 'csrf' => csrf_token()],
  JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Crackwits · Leads</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=Noto+Kufi+Arabic:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/app.css">
</head>
<body>
<header class="top">
  <div class="brand"><span class="mark">CW</span><div><b>Crackwits</b><small>Lead Engine</small></div></div>
  <div class="top-right"><span class="muted" id="updated"></span><a class="btn ghost" href="logout.php">Log out</a></div>
</header>

<main class="wrap">
  <section class="stats" id="stats"></section>

  <section class="filters">
    <input id="q" type="search" placeholder="Search company, sector, city…">
    <select id="f-country"><option value="">All markets</option><option>Kuwait</option><option>Lebanon</option></select>
    <select id="f-priority"><option value="">Any priority</option><option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option></select>
    <select id="f-status"><option value="">Any status</option></select>
    <select id="f-day"><option value="">All days</option></select>
  </section>

  <section id="list" class="list"></section>
  <p id="empty" class="empty" hidden>No leads match these filters.</p>
</main>

<div id="toast" class="toast" hidden></div>
<script>window.CRK = <?= $payload ?>;</script>
<script src="assets/app.js"></script>
</body>
</html>
