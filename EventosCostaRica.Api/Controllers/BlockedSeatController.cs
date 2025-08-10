using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using EventosCostaRica.Business;
using EventosCostaRica.Data;

namespace EventosCostaRica.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlockedSeatController : ControllerBase
    {
        private readonly IBlockedSeatService _blockedSeatService;

        public BlockedSeatController(IBlockedSeatService blockedSeatService)
        {
            _blockedSeatService = blockedSeatService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(BlockedSeat), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateBlockedSeat([FromBody] BSCreateDTO bsCreateDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                await _blockedSeatService.Create(bsCreateDTO);
                return Created();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error intentando crear el asiento bloqueado\n{ex}");
            }
        }

        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteBlockedSeat([FromBody] BSDeleteDTO bsDeleteDTO)
        {
            try
            {
                await _blockedSeatService.Delete(bsDeleteDTO);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error intentando borrar el asiento bloqueado\n{ex}");
            }
        }
    }
}
