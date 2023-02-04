using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System.Text;
using Ufu.Facom.Ppgco.Web.Enums;
using Ufu.Facom.Ppgco.Web.Models;
using RedirectToRouteResult = Microsoft.AspNetCore.Mvc.RedirectToRouteResult;

namespace Ufu.Facom.Ppgco.Web.Filter
{
    public class PaginaRestritaSomenteAdmin : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext context)
        {
            string sessaoUsuario = context.HttpContext.Session.GetString("sessaoUsuarioLogado");
            if (string.IsNullOrEmpty(sessaoUsuario))
            {
                context.Result = new RedirectToRouteResult(new RouteValueDictionary { { "controller", "User" }, { "action", "Login" } });

            }
            else
            {
                Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

                if (usuario is null)
                {
                    context.Result = new RedirectToRouteResult(new RouteValueDictionary { { "controller", "User" }, { "action", "Login" } });

                }
                if (usuario.PerfilId != (long)PerfilEnum.Admin)
                    context.Result = new RedirectToRouteResult(new RouteValueDictionary { { "controller", "Restrito" }, { "action", "Index" } });

            }

            base.OnActionExecuted(context);
        }
    }
}
