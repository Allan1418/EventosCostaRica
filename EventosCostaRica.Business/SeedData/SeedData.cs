using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Business.SeedData
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            var roManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            if (!await roManager.RoleExistsAsync("Usuario"))
            {
                await roManager.CreateAsync(new IdentityRole("Usuario"));
            }

            if (!await roManager.RoleExistsAsync("Administrador"))
            {
                await roManager.CreateAsync(new IdentityRole("Administrador"));
            }
        }
    }

}
