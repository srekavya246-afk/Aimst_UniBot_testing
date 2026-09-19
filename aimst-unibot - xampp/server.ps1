$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Server running at http://localhost:8080/"

$root = $PSScriptRoot

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    
    $relPath = $path.TrimStart('/')
    $localPath = Join-Path (Join-Path $root "frontend") $relPath
    if (-not (Test-Path $localPath -PathType Leaf)) {
        $localPath = Join-Path (Join-Path $root "NLP") $relPath
    }
    if (-not (Test-Path $localPath -PathType Leaf)) {
        $localPath = Join-Path (Join-Path $root "database") $relPath
    }
    if (-not (Test-Path $localPath -PathType Leaf)) {
        $localPath = Join-Path $root $relPath
    }

    if (Test-Path $localPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($localPath)
        
        if ($localPath.EndsWith(".html")) { $response.ContentType = "text/html" }
        elseif ($localPath.EndsWith(".css")) { $response.ContentType = "text/css" }
        elseif ($localPath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
        elseif ($localPath.EndsWith(".png")) { $response.ContentType = "image/png" }

        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.Close()
}
