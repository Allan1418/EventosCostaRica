using EventosCostaRica.Business;
using EventosCostaRica.Data;
using EventosCostaRica.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;


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

builder.Services.AddIdentity<Usuario, IdentityRole>()
    .AddEntityFrameworkStores<ContextoDB>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IRepositoryUsuario, RepositoryUsuario>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();


// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Convertidor para que los enums se traten como strings
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Configuración de autenticación JWT Bearer para el token de acceso
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("La clave secreta para JWT (Jwt:Key) no esta configurada.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});


builder.Services.AddHttpContextAccessor();


// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Eventos Costa Rica API", Version = "v1" });

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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseAuthorization();

app.MapControllers();


// Inicializacion de la Base de Datos
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

// Inicializacion de Roles
if (app.Environment.IsDevelopment())
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var context = services.GetRequiredService<ContextoDB>();

            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

            if (!await roleManager.RoleExistsAsync("USER"))
            {
                await roleManager.CreateAsync(new IdentityRole("USER"));
            }

            if (!await roleManager.RoleExistsAsync("ADMIN"))
            {
                await roleManager.CreateAsync(new IdentityRole("ADMIN"));
            }

        }
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("\n--- ERROR AL INICIAR LOS ROLES ---");
        Console.WriteLine("Ocurrio un error al intentar conectar o crear la base de datos.");
        Console.WriteLine("Revisa tu cadena de conexion en el archivo 'connectionstrings.json' o que el serdidor este online");
        Console.WriteLine($"\nDetalle del error: {ex.Message}");
        Console.ResetColor();
    }
}


// Inicializacion de de usuario admin1
if (app.Environment.IsDevelopment())
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var context = services.GetRequiredService<ContextoDB>();

            // Ponga aqui su logica para crear un usuario admin1 con if exists

        }
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("\n--- ERROR AL CREAR AL USUARIO admin1 ---");
        Console.WriteLine("Ocurrio un error al intentar conectar o crear la base de datos.");
        Console.WriteLine("Revisa tu cadena de conexion en el archivo 'connectionstrings.json' o que el serdidor este online");
        Console.WriteLine($"\nDetalle del error: {ex.Message}");
        Console.ResetColor();
    }
}


app.Run();
