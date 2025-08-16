using Microsoft.AspNetCore.Mvc;
using EventosCostaRica.Business;
using EventosCostaRica.Data;
using Microsoft.AspNetCore.Identity;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
        [Authorize(Roles = "ADMIN")] 
        public async Task<IActionResult> GetAllUsers()
        {
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

        [HttpGet("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var userDetail = await _usuarioService.GetUserByIdAsync(id);
            if (userDetail == null)
            {
                return NotFound(new { message = "Usuario no encontrado." });
            }
            return Ok(userDetail);
        }

        [HttpPut("edit/{id}")]
        [Authorize (Roles = "ADMIN")]
        public async Task<IActionResult> EditUser(string id, [FromBody] EditUserDto editDto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "Usuario no autenticado." });
            }
            var updatedUser = await _usuarioService.EditUserAsync(id, editDto, currentUserId);
            if (updatedUser == null)
            {
                return BadRequest(new { message = "Error al actualizar el usuario." });
            }
            return Ok(updatedUser);
        }

    }
}
