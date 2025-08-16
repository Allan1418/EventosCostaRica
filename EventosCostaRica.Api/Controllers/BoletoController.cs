using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventosCostaRica.Business;
using EventosCostaRica.Data;
using Microsoft.AspNetCore.Authorization;

namespace EventosCostaRica.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BoletoController : ControllerBase
    {
        private readonly IBoletoService _boletoService;
        private readonly IUsuarioService _usuarioService;
        public BoletoController(IBoletoService boletoService, IUsuarioService usuarioService)
        {
            _boletoService = boletoService;
            _usuarioService = usuarioService;
        }

        // Ejemplo de insersion para probar los endpoints.
        /*
        INSERT INTO [dbo].[AspNetUsers]
        (
            [Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], 
            [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], 
            [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]
        )
        VALUES
        (
            '8e445865-a24d-4543-a6c6-9443d048cdb9', 'usuario.prueba', 'USUARIO.PRUEBA', 
            'prueba@ejemplo.com', 'PRUEBA@EJEMPLO.COM', 1, 'AQAAAAIAAYagAAAAENi4V2A+vMv3a+...', 
            'A1B2C3D4E5F6G7H8', 'd8e8f8f9-d5b7-4a1b-9f1c-7a9a8b7c6d5e', NULL, 0, 0, NULL, 1, 0
        );
        */

        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(BoletoGetDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateBoleto([FromBody] BoletoCreateDTO boletoCreateDTO)
        {
            try
            {
                var userId = await _usuarioService.GetIdUserLogged();

                var nuevoBoleto = await _boletoService.Create(boletoCreateDTO,  userId);
                return CreatedAtAction(nameof(GetBoletoById), new { id = nuevoBoleto.Id }, nuevoBoleto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error al procesar la compra.\n{ex}");
            }
        }


        [HttpGet("{id}", Name = "GetBoletoById")]
        [ProducesResponseType(typeof(BoletoGetDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetBoletoById(int id)
        {
            try
            {
                var boleto = await _boletoService.GetById(id);
                return Ok(boleto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error inesperado.\n{ex}");
            }
        }

        [HttpGet("mis-boletos")]
        [Authorize]
        [ProducesResponseType(typeof(List<BoletoGetDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMisBoletos()
        {
            try
            {
                var userId = await _usuarioService.GetIdUserLogged();

                var boletos = await _boletoService.GetByUserId(userId);
                
                return Ok(boletos);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error inesperado.\n{ex}");
            }
        }
    }
}
