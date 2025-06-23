<?php
$url="https://eco.blockchainlock.io/api/eagle-pms/v1";
$api_key="APIキー";
$secret_key="シークレットキー";
$day=gmdate("D, d M Y H:i:s \G\M\T");

//$data = array();
//$jdata = json_encode( $data );
$jdata = "{}";
$digest="SHA-256=".base64_encode(hash('sha256', $jdata, TRUE));

$msg="date: {$day}\nPOST /api/eagle-pms/v1/getUnits HTTP/1.1\ndigest: {$digest}";
$signature=base64_encode(hash_hmac('sha256', $msg, $secret_key, TRUE));

$heder = array(
     'date'=>$day,
     'authorization'=>"hmac username=\"{$api_key}\", algorithm=\"hmac-sha256\", headers=\"date request-line digest\", signature=\"{$signature}\"",
     'x-target-host'=>'default.pms',
     'digest'=>$digest,
     'Content-Type'=>'application/json'
);
$jheder = json_encode( $heder );

//Requests参照先：https://github.com/rmccue/Requests
$request = Requests::post($url."/getUnits", $heder, $jdata);

print("<pre>");
print_r($request);
print("</pre>");
