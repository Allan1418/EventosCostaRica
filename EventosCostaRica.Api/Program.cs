using EventosCostaRica.Business;
using EventosCostaRica.Data;
using EventosCostaRica.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// DB Context Configuration
builder.Configuration.AddJsonFile("connectionstrings.json", optional: true, reloadOnChange: true);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ContextoDB>(options => options.UseSqlServer(connectionString));

builder.Services.AddIdentity<Usuario, IdentityRole>()
    .AddEntityFrameworkStores<ContextoDB>()
    .AddDefaultTokenProviders();

// Configuración de autenticación JWT Bearer para el token de acceso
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // Valida el emisor (Issuer) del token
        ValidateAudience = true, // Valida la audiencia (Audience) del token
        ValidateLifetime = true, // Valida el tiempo de vida del token (expiración)
        ValidateIssuerSigningKey = true, // Valida la firma del token con la clave secreta

        // Obtiene los valores de tu appsettings.json
        ValidIssuer = builder.Configuration["Jwt:Issuer"], // Asegúrate de tener "Issuer" en appsettings.json
        ValidAudience = builder.Configuration["Jwt:Audience"], // Asegúrate de tener "Audience" en appsettings.json
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])) // La clave secreta para validar
    };
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Registro de tus servicios y repositorios personalizados
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped(typeof(IRepositoryBase<>), typeof(RepositoryBase<>));
builder.Services.AddScoped<IRepositoryUsuarios, RepositoryUsuarios>();


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

// Bloque 1: Configuración de Swagger y lógica de migración de la base de datos.
if (app.Environment.IsDevelopment())
{
    // ¡IMPORTANTE! Mueve UseSwagger y UseSwaggerUI aquí, al inicio del bloque de desarrollo.
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

// Estos middlewares deben venir DESPUÉS de Swagger (si Swagger está en el bloque de desarrollo)
// ya que manejan el enrutamiento y la seguridad de tus APIs principales.
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers(); // Este debe ser de los últimos, después de la seguridad.


// Bloque 2: Lógica de inicialización de roles (separado del de migración)
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

    if (!await roleManager.RoleExistsAsync("USUARIO"))
    {
        await roleManager.CreateAsync(new IdentityRole("USUARIO"));
    }

    if (!await roleManager.RoleExistsAsync("ADMINISTRADOR"))
    {
        await roleManager.CreateAsync(new IdentityRole("ADMINISTRADOR"));
    }

    if (!await roleManager.RoleExistsAsync("CLIENTE"))
    {
        await roleManager.CreateAsync(new IdentityRole("CLIENTE"));
    }
}
