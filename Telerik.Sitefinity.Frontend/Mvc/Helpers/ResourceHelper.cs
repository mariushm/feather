﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Telerik.Sitefinity.Frontend.Resources;

namespace Telerik.Sitefinity.Frontend.Mvc.Helpers
{
    /// <summary>
    /// This class contains helper methods for registering client resources.
    /// </summary>
    public static class ResourceHelper
    {
        /// <summary>
        /// Registers javascript reference.
        /// </summary>
        /// <param name="scriptPath">The path to the javascript file.</param>
        /// <param name="throwException">OPTIONAL: Indicates whether to throw an exception if the javascript is already registered. By default the value is set to <value>false</value>.</param>
        /// <returns>MvcHtmlString</returns>
        public static MvcHtmlString Script(this HtmlHelper helper, string scriptPath, bool throwException = false)
        {
            var attributes = new KeyValuePair<string,string>[2];
            attributes[0] = new KeyValuePair<string, string>("src", scriptPath);
            attributes[1] = new KeyValuePair<string, string>("type", "text/javascript");

            var register = new ClientResourceRegister("JsRegister", "script", "src");

            return ResourceHelper.RegisterResource(register, attributes, throwException);
        }
        
        private static MvcHtmlString RegisterResource(ClientResourceRegister register, KeyValuePair<string,string>[] attributes, bool throwException)
        {
            string output;
            MvcHtmlString result;

            if (throwException)
                result = new MvcHtmlString(register.RegisterResource(attributes));
            else if (register.TryRegisterResource(out output, attributes))
                result = new MvcHtmlString(output);
            else
                result = MvcHtmlString.Empty;

            return result;
        }
    }
}