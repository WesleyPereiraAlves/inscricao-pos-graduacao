namespace Ufu.Facom.Ppgco.Web.Util
{
    public class Settings
    {
        public static IConfiguration GetConfiguration(string jsonfile)
        {
            var builder = new ConfigurationBuilder().SetBasePath(AppContext.BaseDirectory).AddJsonFile(jsonfile);

            return builder.Build();
        }

    }
}
