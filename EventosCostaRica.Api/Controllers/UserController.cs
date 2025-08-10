using Microsoft.AspNetCore.Mvc;
using EventosCostaRica.Business;
using EventosCostaRica.Data;
using Microsoft.AspNetCore.Identity;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Authorization;

namespace EventosCostaRica.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUsuarioService usuarioService, ILogger<UserController> logger)
        {
            _usuarioService = usuarioService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var token = await _usuarioService.Login(loginDto);

            if (token == null)
            {
                return Unauthorized(new { message = "Usuario o contraseña invalida" });
            }
            return Ok(new { token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        {
            var result = await _usuarioService.Register(registerDto);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Error al registrar el usuario", errors = result.Errors.Select(e => e.Description) });
            }
            return Ok(new { message = "Usuario registrado con exito." });
        }

        [HttpGet("list")]
        [Authorize(Roles = "ADMINISTRADOR")] // Asegúrate que coincida con el nombre del rol en la DB
        public async Task<IActionResult> GetAllUsers()
        {
            // --- INICIO: Añadir log para depuración ---
            _logger.LogInformation("Entrando al método GetAllUsers. Claims del usuario actual:");
            foreach (var claim in HttpContext.User.Claims)
            {
                _logger.LogInformation($"  Tipo: {claim.Type}, Valor: {claim.Value}");
            }
            // --- FIN: Añadir log para depuración ---

            var users = await _usuarioService.GetAllUserAsync();
            if (users == null || !users.Any())
            {
                return NotFound(new { message = "No se encontraron usuarios." });
            }
            return Ok(users);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _usuarioService.Logout();
            return Ok(new { message = "Usuario ha cerrado sesión con exito." });
        } 

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userDetail = await _usuarioService.LoggedUserDetailAsync();
            if (userDetail == null)
            {
                return NotFound(new { message = "Usuario no encontrado." });
            }
            return Ok(userDetail);
        }
    }
}
