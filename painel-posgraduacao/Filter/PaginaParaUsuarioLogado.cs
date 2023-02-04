using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using Ufu.Facom.Ppgco.Web.Models;
using RedirectToRouteResult = Microsoft.AspNetCore.Mvc.RedirectToRouteResult;

namespace Ufu.Facom.Ppgco.Web.Filter
{
    public class PaginaParaUsuarioLogado : ActionFilterAttribute
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

                if (usuario == null)
                {
                    context.Result = new RedirectToRouteResult(new RouteValueDictionary { { "controller", "User" }, { "action", "Login" } });

                }
            }

            base.OnActionExecuted(context);
        }
    }
}
