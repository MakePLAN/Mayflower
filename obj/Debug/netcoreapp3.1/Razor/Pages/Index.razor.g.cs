#pragma checksum "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\Pages\Index.razor" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "1eaee5e60c89c863a41d37d06dd3d87b5d7fe412"
// <auto-generated/>
#pragma warning disable 1591
namespace Mayflower.Pages
{
    #line hidden
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Components;
#nullable restore
#line 1 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using System.Net.Http;

#line default
#line hidden
#nullable disable
#nullable restore
#line 2 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Microsoft.AspNetCore.Authorization;

#line default
#line hidden
#nullable disable
#nullable restore
#line 3 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Microsoft.AspNetCore.Components.Authorization;

#line default
#line hidden
#nullable disable
#nullable restore
#line 4 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Microsoft.AspNetCore.Components.Forms;

#line default
#line hidden
#nullable disable
#nullable restore
#line 5 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Microsoft.AspNetCore.Components.Routing;

#line default
#line hidden
#nullable disable
#nullable restore
#line 6 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Microsoft.AspNetCore.Components.Web;

#line default
#line hidden
#nullable disable
#nullable restore
#line 7 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Microsoft.JSInterop;

#line default
#line hidden
#nullable disable
#nullable restore
#line 8 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Mayflower;

#line default
#line hidden
#nullable disable
#nullable restore
#line 9 "C:\Users\ble24\Documents\Projects\junction2022\Mayflower\_Imports.razor"
using Mayflower.Shared;

#line default
#line hidden
#nullable disable
    [Microsoft.AspNetCore.Components.RouteAttribute("/")]
    public partial class Index : Microsoft.AspNetCore.Components.ComponentBase
    {
        #pragma warning disable 1998
        protected override void BuildRenderTree(Microsoft.AspNetCore.Components.Rendering.RenderTreeBuilder __builder)
        {
            __builder.AddMarkupContent(0, "<h1>Hello, world!</h1>\r\n\r\nWelcome to your new app.\r\n\r\n");
            __builder.OpenComponent<Mayflower.Shared.SurveyPrompt>(1);
            __builder.AddAttribute(2, "Title", "How is Blazor working for you?");
            __builder.CloseComponent();
        }
        #pragma warning restore 1998
    }
}
#pragma warning restore 1591
