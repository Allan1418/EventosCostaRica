using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using EventosCostaRica.Data;
using EventosCostaRica.Repository;
using EventosCostaRica.Business;


var builder = WebApplication.CreateBuilder(args);

// DB Context Configuration
builder.Configuration.AddJsonFile("connectionstrings.json", optional: true, reloadOnChange: true);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ContextoDB>(options => options.UseSqlServer(connectionString));

builder.Services.AddScoped(typeof(IRepositoryBase<>), typeof(RepositoryBase<>));

builder.Services.AddScoped<IRepositoryEvento, RepositoryEvento>();
builder.Services.AddScoped<IEventoService, EventoService>();

builder.Services.AddScoped<IRepositoryBlockedSeat, RepositoryBlockedSeat>();
builder.Services.AddScoped<IBlockedSeatService, BlockedSeatService>();

builder.Services.AddScoped<IRepositoryBoleto, RepositoryBoleto>();
builder.Services.AddScoped<IBoletoService, BoletoService>();

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Convertidor para que los enums se traten como strings
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();


if (app.Environment.IsDevelopment())
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var context = services.GetRequiredService<ContextoDB>();

            if (context.Database.CanConnect())
            {
                Console.WriteLine("MODO DESARROLLO: La base de datos ya existe. ¿Desea reiniciarla? (y/n)");
                string? response = Console.ReadLine()?.ToLower().Trim();
                Console.WriteLine();

                if (response == "y")
                {
                    Console.WriteLine("Borrando y recreando la base de datos...");
                    context.Database.EnsureDeleted();
                    context.Database.Migrate();
                    Console.WriteLine("Base de datos reiniciada con exito.");
                }
                else
                {
                    Console.WriteLine("Se omitio el reinicio de la base de datos.");
                }
            }
            else
            {
                Console.WriteLine("MODO DESARROLLO: La base de datos no existe. Creandola...");
                context.Database.Migrate();
                Console.WriteLine("Base de datos creada con exito.");
            }
        }
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("\n--- ERROR AL INICIAR LA BASE DE DATOS ---");
        Console.WriteLine("Ocurrio un error al intentar conectar o crear la base de datos.");
        Console.WriteLine("Revisa tu cadena de conexion en el archivo 'connectionstrings.json' o que el serdidor este online");
        Console.WriteLine($"\nDetalle del error: {ex.Message}");
        Console.ResetColor();
    }
}


app.Run();
