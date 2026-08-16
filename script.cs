using System;
using System.IO;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var key = Encoding.UTF8.GetBytes("12345678901234567890123456789012");
        var iv = Encoding.UTF8.GetBytes("1234567890123456");

        var json = @"{
            ""projectId"": ""3fa85f64-5717-4562-b3fc-2c963f66afa6"",
            ""name"": ""Test Plan ISTQB"",
            ""startDate"": ""2026-08-01T00:00:00"",
            ""endDate"": ""2026-08-10T00:00:00"",
            ""criteria"": [
                { ""criteriaType"": ""ENTRY"", ""description"": ""desc"", ""isMet"": false, ""priority"": ""HIGH"", ""category"": ""ENVIRONMENT"" }
            ],
            ""milestones"": [
                { ""name"": ""m1"", ""dueDate"": ""2026-08-06T00:00:00"", ""isCompleted"": false }
            ]
        }";

        string encrypted;
        using (var aes = Aes.Create())
        {
            aes.Key = key;
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
            using (var ms = new MemoryStream())
            {
                using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                using (var sw = new StreamWriter(cs))
                {
                    sw.Write(json);
                }
                encrypted = Convert.ToBase64String(ms.ToArray());
            }
        }

        var client = new HttpClient();
        var content = new StringContent(encrypted, Encoding.UTF8, "text/plain");
        var response = await client.PostAsync("http://localhost:5000/api/TestPlans", content);
        var responseBody = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Status: {response.StatusCode}");
        Console.WriteLine($"Body: {responseBody}");
    }
}
