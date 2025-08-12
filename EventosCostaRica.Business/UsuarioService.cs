using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using EventosCostaRica.Repository;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;

namespace EventosCostaRica.Business
{
    public interface IUsuarioService
    {
        Task<string> Login(LoginDTO loginDto);
        Task<IdentityResult> Register(RegisterDTO registerDto);
        Task<IEnumerable<UserDTO>> GetAllUserAsync();
        Task Logout();
        Task<UserDTO> LoggedUserDetailAsync();
        Task<UserDTO> GetUserByIdAsync(string id);
    }
    public class UsuarioService : IUsuarioService
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IRepositoryUsuario _repositoryUsuarios;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UsuarioService(UserManager<Usuario> userManager, SignInManager<Usuario> signInManager,
            IConfiguration configuration, IRepositoryUsuario repositoryUsuarios, 
            IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _repositoryUsuarios = repositoryUsuarios;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> Login(LoginDTO loginDto)
        {
            var usuario = await _userManager.FindByEmailAsync(loginDto.Email);
            if (usuario == null)
            {
                return null;
            }

            //verifica la contraseña del usuario
            var result = await _signInManager.CheckPasswordSignInAsync(usuario, loginDto.Password, false);

            if (!result.Succeeded)return null;

            var rolesDelUsuario = await _userManager.GetRolesAsync(usuario);

            return GenerateJwtToken(usuario);
        }

        public async Task<IdentityResult> Register(RegisterDTO registerDto)
        {
            var usuario = new Usuario
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email
            };
            //Crea el usuario con la contraseña proporcionada
            var result = await _userManager.CreateAsync(usuario, registerDto.Password);
            if (result.Succeeded)
            {
                //Si el registro es exitoso, se le asigna el rol de usuario por defecto
                await _userManager.AddToRoleAsync(usuario, "ADMIN");
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
                new Claim(ClaimTypes.NameIdentifier, usuario.Id), //Identificador del usuario
                new Claim(JwtRegisteredClaimNames.Iss, _configuration["Jwt:Issuer"]),
                new Claim(JwtRegisteredClaimNames.Aud, _configuration["Jwt:Audience"])

            };
            var roles = _userManager.GetRolesAsync(usuario).Result;
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role)); //Agrega los roles del usuario como claims
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims), //Asigna los claims al token
                Expires = DateTime.UtcNow.AddDays(1), //Establece la fecha de expiración del token
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature) //Firma el token con la clave secreta
            };
            var token = tokenHandler.CreateToken(tokenDescriptor); //Crea el token con los parametros definidos
            return tokenHandler.WriteToken(token); //Convierte el token a una cadena y la retorna
        }

        public async Task<IEnumerable<UserDTO>> GetAllUserAsync()
        {
            var usuarios = await _repositoryUsuarios.GetAll();

            return usuarios.Select(u => new UserDTO
            {
                Id = u.Id,
                UserName = u.UserName,
                Email = u.Email
            }).ToList(); 
        }

        public async Task Logout()
        {
            await Task.CompletedTask;
        }

        public async Task<UserDTO> LoggedUserDetailAsync()
        {
            
            // Obtiene el ID del usuario de los claims (NameIdentifier es el UserId)
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var usuario = await _userManager.FindByIdAsync(userId);

            return new UserDTO
            {
                Id = usuario.Id,
                UserName = usuario.UserName,
                Email = usuario.Email
            };
        }

        public async Task<UserDTO> GetUserByIdAsync(string id)
        {
            var usuario = await _userManager.FindByIdAsync(id);
            if (usuario == null) return null;
            return new UserDTO
            {
                Id = usuario.Id,
                UserName = usuario.UserName,
                Email = usuario.Email
            };
        }


    }
}
