using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace EventosCostaRica.Data
{
    public class Usuario : IdentityUser
    {
        public virtual ICollection<Boleto> Boletos { get; set; } = new List<Boleto>();
    }
}
