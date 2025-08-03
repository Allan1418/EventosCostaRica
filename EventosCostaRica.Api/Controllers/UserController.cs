using Microsoft.AspNetCore.Mvc;
using EventosCostaRica.Business;
using EventosCostaRica.Data.Dtos; // Importamos los DTOs
using Microsoft.AspNetCore.Identity;
using System.Runtime.CompilerServices;

namespace EventosCostaRica.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UserController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        { 
            var token = await _usuarioService.Login(loginDto);

            if (token == null)
            { 
                return Unauthorized(new { message = "Usuario o contraseña invalida" });
            }
            return Ok(new { token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _usuarioService.Register(registerDto);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Error al registrar el usuario", errors = result.Errors.Select(e => e.Description) });
            }
            return Ok(new { message = "Usuario registrado con exito." });
        }

    }
}
