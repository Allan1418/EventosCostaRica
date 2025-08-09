using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data.Dtos
{
    //Se utiliza para enviar información del usuario al cliente sin que se expongan datos sensibles
    public class UserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
    }

   public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
    public class RegisterDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
