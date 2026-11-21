
# -------------------------------------
# Gateway Batch Load Test
# -------------------------------------

$gatewayKey = $env:GATEWAY_API_KEY

if (-not $gatewayKey) {
    throw "Set GATEWAY_API_KEY environment variable first."
}

$uri = "http://localhost:3000/api/v1/gateway/chat/completions"

# Change this to test another model
$model = "gemini/gemini-3.5-flash"

# Number of requests
$requestCount = 15

# Maximum simultaneously executing requests
$throttleLimit = 5

$requests = 1..$requestCount | ForEach-Object {
    [PSCustomObject]@{
        Id = $_
        Prompt = "Request $_`: Explain one important concept in JavaScript in two sentences."
    }
}

Write-Host "`nStarting $requestCount requests..."
Write-Host "Model: $model"
Write-Host "Concurrency: $throttleLimit`n"

$results = $requests | ForEach-Object -Parallel {

    $item = $_

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    try {
        $headers = @{
            Authorization = "Bearer $using:gatewayKey"
            "Content-Type" = "application/json"
        }

        $body = @{
            model = $using:model

            messages = @(
                @{
                    role = "user"
                    content = $item.Prompt
                }
            )

            max_tokens = 128
            temperature = 0.2
        } | ConvertTo-Json -Depth 10

        $response = Invoke-RestMethod `
            -Method POST `
            -Uri $using:uri `
            -Headers $headers `
            -Body $body `
            -TimeoutSec 90 `
            -ErrorAction Stop

        $stopwatch.Stop()

        [PSCustomObject]@{
            Request      = $item.Id
            Status       = $response.status
            Provider     = $response.provider
            Model        = $response.model
            LatencyMs    = $stopwatch.ElapsedMilliseconds
            InputTokens  = $response.usage.inputTokens
            OutputTokens = $response.usage.outputTokens
            CostUSD      = $response.cost.amount
            Error        = ""
        }

    }
    catch {

        $stopwatch.Stop()

        $errorMessage = $_.ErrorDetails.Message

        if (-not $errorMessage) {
            $errorMessage = $_.Exception.Message
        }

        [PSCustomObject]@{
            Request      = $item.Id
            Status       = "FAILED"
            Provider     = ""
            Model        = $using:model
            LatencyMs    = $stopwatch.ElapsedMilliseconds
            InputTokens  = 0
            OutputTokens = 0
            CostUSD      = 0
            Error        = $errorMessage
        }
    }

} -ThrottleLimit $throttleLimit

# -------------------------------------
# RESULTS
# -------------------------------------

Write-Host "`n========== REQUEST RESULTS ==========`n"

$results |
    Sort-Object Request |
    Format-Table Request, Status, Provider, LatencyMs,
                 InputTokens, OutputTokens, CostUSD -AutoSize

$successful = @($results | Where-Object { $_.Status -eq "success" }).Count
$failed = $requestCount - $successful

Write-Host "`n========== SUMMARY =========="
Write-Host "Total Requests : $requestCount"
Write-Host "Successful     : $successful"
Write-Host "Failed         : $failed"

$latencies = @($results | Where-Object { $_.Status -eq "success" })

if ($latencies.Count -gt 0) {

    $average = ($latencies |
        Measure-Object -Property LatencyMs -Average).Average

    $maximum = ($latencies |
        Measure-Object -Property LatencyMs -Maximum).Maximum

    Write-Host "Average Latency: $([math]::Round($average, 2)) ms"
    Write-Host "Maximum Latency: $maximum ms"
}
