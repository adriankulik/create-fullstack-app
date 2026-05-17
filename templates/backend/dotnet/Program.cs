using Microsoft.AspNetCore.Mvc;

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

app.MapPost("/api/multiply", ([FromBody] MultiplyRequest request) =>
{
    return new { result = request.Number * 2 };
});



app.Run("http://localhost:8000");

class MultiplyRequest
{
    public double Number { get; set; }
}

public partial class Program { }
