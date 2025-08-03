using EventosCostaRica.Business;
using EventosCostaRica.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// DB Context Configuration
builder.Configuration.AddJsonFile("connectionstrings.json", optional: true, reloadOnChange: true);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ContextoDB>(options => options.UseSqlServer(connectionString));

builder.Services.AddIdentity<Usuario,IdentityRole>()
    .AddEntityFrameworkStores<ContextoDB>()
    .AddDefaultTokenProviders();


// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();



builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Eventos Costa Rica API", Version = "v1" });

    // Configuración para el token JWT (Bearer)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Ingresa el token JWT de esta manera: Bearer {tu token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
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

if (app.Environment.IsDevelopment())
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            await InitializeRolesAsync(services);
            Console.WriteLine("Roles inicializados con éxito.");
        }
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al inicializar los roles.");
    }
}

app.Run();

static async Task InitializeRolesAsync(IServiceProvider serviceProvider)
{
    var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    if (!await roleManager.RoleExistsAsync("Usuario"))
    {
        await roleManager.CreateAsync(new IdentityRole("Usuario"));
    }

     if (!await roleManager.RoleExistsAsync("Administrador"))
     {
         await roleManager.CreateAsync(new IdentityRole("Administrador"));
     }

    if (!await roleManager.RoleExistsAsync("Cliente"))
    {
        await roleManager.CreateAsync(new IdentityRole("Cliente"));
    }
}
