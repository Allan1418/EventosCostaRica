using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class UserDTO
    {
        public string? Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public List<string>? Roles { get; set; }
    }

   public class LoginDTO
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
    public class RegisterDTO
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
    }

    public class  EditUserDto
    {
        [Required]
        public string Id {get; set;}

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string UserName { get; set; }

        public List<string> Roles { get; set; } = new List<string>();
    }
}
