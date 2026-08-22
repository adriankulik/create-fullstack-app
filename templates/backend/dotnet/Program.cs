using Microsoft.AspNetCore.Mvc;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add CORS to allow frontend to access
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ?? "postgresql://user:password@localhost:5432/appdb";
var connStr = dbUrl;
if (dbUrl.StartsWith("postgres://") || dbUrl.StartsWith("postgresql://"))
{
    var uri = new Uri(dbUrl);
    var userInfo = uri.UserInfo.Split(':');
    connStr = $"Host={uri.Host};Port={uri.Port};Username={userInfo[0]};Password={userInfo[1]};Database={uri.LocalPath.Substring(1)}";
}

app.MapPost("/api/multiply", async ([FromBody] MultiplyRequest request) =>
{
    var result = request.Number * 2;
    try
    {
        await using var dataSource = NpgsqlDataSource.Create(connStr);
        await using var cmd = dataSource.CreateCommand("INSERT INTO calculations (input_number, result) VALUES (@input_number, @result)");
        cmd.Parameters.AddWithValue("input_number", request.Number);
        cmd.Parameters.AddWithValue("result", result);
        await cmd.ExecuteNonQueryAsync();
    }
    catch (Exception e)
    {
        Console.WriteLine($"Error saving to db: {e.Message}");
    }
    
    return new { result };
});

app.Run("http://localhost:8000");

class MultiplyRequest
{
    public double Number { get; set; }
}

public partial class Program { }
