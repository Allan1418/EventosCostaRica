using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using EventosCostaRica.Data.Dtos;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace EventosCostaRica.Business
{
    public interface IUsuarioService
    {
        Task<string> Login(LoginDto loginDto);
        Task<IdentityResult> Register(RegisterDto registerDto);
    }
    public class UsuarioService : IUsuarioService
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;
        private readonly IConfiguration _configuration;

        public UsuarioService(UserManager<Usuario> userManager, SignInManager<Usuario> signInManager, IConfiguration configuration)
        { 
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }
        public async Task<string> Login(LoginDto loginDto)
        {
            var  usuario = await _userManager.FindByNameAsync(loginDto.UserName);
            if (usuario == null)
            {
                return null;
            }

            //verifica la contraseña del usuario
            var result = await _signInManager.CheckPasswordSignInAsync(usuario, loginDto.Password, false);

            if (!result.Succeeded)
            {
                return null;
            }
            return GenerateJwtToken(usuario);
        } 

        public async Task<IdentityResult> Register(RegisterDto registerDto)
        {
            var usuario = new Usuario
            {
                UserName = registerDto.Username,
                Email = registerDto.Email
            };
            //Crea el usuario con la contraseña proporcionada
            var result = await _userManager.CreateAsync(usuario, registerDto.Password);
            if (result.Succeeded)
            {
                //Si el registro es exitoso, se le asigna el rol de usuario por defecto
                await _userManager.AddToRoleAsync(usuario, "Usuario");
            }
            return result;
        }

        public string GenerateJwtToken(Usuario usuario)
        {
            var tokenHandler = new JwtSecurityTokenHandler();//Crear tokens, lee los tokens y los valida si estos no han expirado
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);// accede a la clave secreta del JWT desde la configuración
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, usuario.UserName), //Nombre de usuario
                new Claim(ClaimTypes.Email, usuario.Email), //Email del usuario
                new Claim(ClaimTypes.NameIdentifier, usuario.Id) //Identificador del usuario
            };
            var roles = _userManager.GetRolesAsync(usuario).Result;
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role)); //Agrega los roles del usuario como claims
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims), //Asigna los claims al token
                Expires = DateTime.UtcNow.AddHours(1), //Establece la fecha de expiración del token
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature) //Firma el token con la clave secreta
            };
            var token = tokenHandler.CreateToken(tokenDescriptor); //Crea el token con los parámetros definidos
            return tokenHandler.WriteToken(token); //Convierte el token a una cadena y la retorna
        }


    }
}
