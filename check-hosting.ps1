# Check hosting files

$ftpServer = "ftp://school-board.online/"
$ftpUsername = "infoitaso3_board"
$ftpPassword = "HGKHGJFGasadsdf12##"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CHECKING HOSTING FILES" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

try {
    $request = [System.Net.FtpWebRequest]::Create($ftpServer)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
    $request.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $request.UsePassive = $true
    
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $content = $reader.ReadToEnd()
    $reader.Close()
    $response.Close()
    
    Write-Host "FILES IN ROOT:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $content
    Write-Host ""
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "CHECKING /CALCULATOR/..." -ForegroundColor Yellow
try {
    $request2 = [System.Net.FtpWebRequest]::Create("$ftpServer/calculator/")
    $request2.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
    $request2.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $request2.UsePassive = $true
    
    $response2 = $request2.GetResponse()
    $reader2 = New-Object System.IO.StreamReader($response2.GetResponseStream())
    $content2 = $reader2.ReadToEnd()
    $reader2.Close()
    $response2.Close()
    
    Write-Host "FILES IN /CALCULATOR/:" -ForegroundColor Green
    Write-Host ""
    Write-Host $content2
}
catch {
    Write-Host "ERROR: calculator/ folder not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press Enter to exit"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
