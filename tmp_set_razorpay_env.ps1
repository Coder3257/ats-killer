$p=".env"
$k1="RAZORPAY_KEY_ID"
$k2="RAZORPAY_KEY_SECRET"
$v1="rzp_test_TCdl0j6bf3YLEa"
$v2="HkItq1R8ZfTic1uxYLotAPGx"

if(Test-Path $p){
  $raw = Get-Content $p -Raw
} else {
  $raw = ""
}

$lines = $raw -split "`r?`n"
$out = New-Object System.Collections.Generic.List[string]

foreach($l in $lines){
  if($l -match ("^" + [regex]::Escape($k1) + "=.*$")) { continue }
  if($l -match ("^" + [regex]::Escape($k2) + "=.*$")) { continue }
  if($l -ne "") { $out.Add($l) }
}

$out.Add($k1 + "=" + $v1)
$out.Add($k2 + "=" + $v2)

Set-Content -Path $p -Value ($out -join "`r`n") -Encoding UTF8

"Updated .env razorpay lines:"
Select-String -Path $p -Pattern "^(RAZORPAY_KEY_ID|RAZORPAY_KEY_SECRET)=" -SimpleMatch | ForEach-Object { $_.Line }
