FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY backend.sln dotnet.csproj ./
COPY Tests/Tests.csproj ./Tests/
RUN dotnet restore backend.sln

COPY . ./
RUN dotnet publish dotnet.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out ./

EXPOSE 8000
ENV ASPNETCORE_URLS=http://0.0.0.0:8000

CMD ["dotnet", "dotnet.dll"]
