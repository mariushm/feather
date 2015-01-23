using System.Web;
using System.Web.Mvc;
using Telerik.Sitefinity.Modules.GenericContent;
using Telerik.Sitefinity.Services;
using Telerik.Sitefinity.Web.Utilities;

namespace Telerik.Sitefinity.Frontend.Mvc.Helpers
{
    /// <summary>
    /// This class contains helper methods for rendering content data in views.
    /// </summary>
    public static class ContentHelper
    {
        /// <summary>
        /// Replaces all dynamic links in the specified HTML text with their actual URL paths. 
        /// </summary>
        /// <param name="htmlHelper">The HTML helper.</param>
        /// <param name="source">The source HTML markup.</param>
        /// <returns>HTML with actual URL paths.</returns>
        public static IHtmlString ResolveLinks(this HtmlHelper htmlHelper, string source)
        {
            var parsedContent = LinkParser.ResolveLinks(source, DynamicLinksParser.GetContentUrl, null, SystemManager.IsInlineEditingMode);
            return htmlHelper.Raw(parsedContent);
        }
    }
}
