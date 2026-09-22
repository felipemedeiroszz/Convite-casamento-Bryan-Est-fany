$body = @{
    paymentId = "1b94fc39-a643-42d3-b83e-44439587e9b9"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/test-confirm-payment" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
