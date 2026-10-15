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
usort($leads, fn($a, $b) => strcmp($b['added'], $a['added']));
$payload = json_encode(['leads' => $leads, 'updated' => $data['updated'] ?? '', 'csrf' => csrf_token()],
  JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Crackwits · Leads</title>
<link rel="stylesheet" href="assets/app.css?v=2">
</head>
<body>
<header class="top">
  <img class="logo" src="assets/logo.svg" alt="Crackwits" width="168" height="32">
  <div class="top-right"><span class="muted" id="updated"></span><a class="btn ghost" href="logout.php">Log out</a></div>
</header>

<main class="wrap">
  <section class="stats" id="stats"></section>

  <section class="filters">
    <input id="q" type="search" placeholder="Search company, sector, city…">
    <select id="f-country"><option value="">All markets</option><option>Kuwait</option><option>Lebanon</option></select>
    <select id="f-status"><option value="">Any status</option></select>
    <select id="f-day"><option value="">All days</option></select>
  </section>

  <section id="grid" class="grid"></section>
  <p id="empty" class="empty" hidden>No leads match these filters.</p>
</main>

<dialog id="modal" class="modal" aria-labelledby="m-title">
  <div class="modal-inner" id="m-body"></div>
</dialog>

<div id="toast" class="toast" hidden></div>
<script>window.CRK = <?= $payload ?>;</script>
<script src="assets/app.js?v=2"></script>
</body>
</html>
