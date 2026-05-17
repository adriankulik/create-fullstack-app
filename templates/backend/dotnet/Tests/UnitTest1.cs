using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Tests;

public class UnitTest1 : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public UnitTest1(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task MultiplyEndpoint_ReturnsDouble()
    {
        var client = _factory.CreateClient();
        var request = new { number = 5 };

        var response = await client.PostAsJsonAsync("/api/multiply", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<MultiplyResponse>();
        Assert.NotNull(result);
        Assert.Equal(10, result.result);
    }
    
    [Fact]
    public async Task MultiplyEndpoint_Returns400_ForInvalidInput()
    {
        var client = _factory.CreateClient();
        var request = new { number = "not a number" };

        var response = await client.PostAsJsonAsync("/api/multiply", request);
        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }
    
    class MultiplyResponse
    {
        public double result { get; set; }
    }
}