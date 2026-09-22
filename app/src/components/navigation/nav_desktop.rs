use app_components::LogoHomeLink;
use app_domain::constants::RoutePaths;
use app_routes::{ComponentsRoutes, HooksRoutes};
use icons::ExternalLink;
use leptos::prelude::*;
use registry::ui::link::{Link, PathMatchType};
use registry::ui::navigation_menu::{
    NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList,
    NavigationMenuTrigger,
};

const DIOXUS_URL: &str = "https://dioxus.rust-ui.com";
const RUSTIFY_URL: &str = "https://www.rustify.rs";
const LOGO_SQUARE_DARK: &str = "/icons/logo-dark-square-48.webp";
const LOGO_SQUARE_LIGHT: &str = "/icons/logo-light-square-48.webp";

const NAV_LINK_CLASS: &str =
    "inline-flex items-center px-2.5 py-1.5 h-8 text-sm font-medium rounded-md transition-colors hover:bg-accent group";
// text-shadow trick: a same-colored duplicate of the label sits one line-height below the
// visible text. On hover the span translates up by that same offset, so the shadow copy
// slides into view in place of the original, an always-on-hand "slide up" effect from a
// single span (no duplicated markup needed).
const NAV_LINK_TEXT_CLASS: &str =
    "inline-block transition-transform duration-300 ease-out group-hover:-translate-y-[1.2em] [text-shadow:0_1.2em_0_var(--foreground)]";

#[component]
pub fn NavDesktop() -> impl IntoView {
    view! {
        <div class="hidden gap-0 items-center md:flex">

            <LogoHomeLink />

            <NavigationMenu class="relative z-auto max-w-none flex-none">
                <NavigationMenuList class="gap-0">
                    <NavigationMenuItem>
                        <NavigationMenuTrigger class="gap-1 px-1.5 h-8 text-base font-medium bg-transparent border-none shadow-none hover:bg-transparent hover:text-foreground data-[state=open]:bg-transparent">
                            "Rust/UI"
                        </NavigationMenuTrigger>
                        <NavigationMenuContent class="md:w-[380px] p-4">
                            <div class="grid grid-cols-[1fr_auto] gap-6">
                                <div class="flex flex-col gap-2">
                                    <span class="text-xs font-medium text-muted-foreground">"Latest"</span>
                                    <NavigationMenuLink
                                        href="/"
                                        class="flex relative flex-col gap-2 p-3 w-full rounded-md border hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <div class="flex justify-center items-center rounded-md size-9 bg-muted">
                                            <img
                                                src=LOGO_SQUARE_DARK
                                                alt="Logo Rust/UI"
                                                class="hidden dark:block size-5"
                                            />
                                            <img
                                                src=LOGO_SQUARE_LIGHT
                                                alt="Logo Rust/UI"
                                                class="dark:hidden size-5"
                                            />
                                        </div>
                                        <span class="text-sm font-medium">"Rust/UI"</span>
                                        <span class="text-xs text-muted-foreground">
                                            "Reusable components for Leptos and Rust fullstack apps"
                                        </span>
                                        <ExternalLink class="absolute top-3 right-3 size-3.5 text-muted-foreground" />
                                    </NavigationMenuLink>
                                </div>
                                <div class="flex flex-col gap-2 min-w-[120px]">
                                    <span class="text-xs font-medium text-muted-foreground">"Ecosystem"</span>
                                    <NavigationMenuLink
                                        href=DIOXUS_URL
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="gap-1 px-2 py-1.5 w-full rounded-sm hover:bg-accent hover:text-accent-foreground"
                                    >
                                        "Dioxus UI"
                                        <ExternalLink class="size-3 text-muted-foreground" />
                                    </NavigationMenuLink>
                                    <NavigationMenuLink
                                        href=RUSTIFY_URL
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="gap-1 px-2 py-1.5 w-full rounded-sm hover:bg-accent hover:text-accent-foreground"
                                    >
                                        "Rustify"
                                        <ExternalLink class="size-3 text-muted-foreground" />
                                    </NavigationMenuLink>
                                </div>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

            <span aria-hidden="true" class="mx-1 select-none text-muted-foreground/50">
                "/"
            </span>

            <Link
                href=ComponentsRoutes::Button.to_route()
                class=NAV_LINK_CLASS
                match_type=PathMatchType::StartsWithExcept(
                    ComponentsRoutes::base_url().to_string(),
                    vec![
                        "/docs/components/introduction".to_string(),
                        "/docs/components/installation".to_string(),
                        "/docs/components/cli".to_string(),
                        "/docs/components/icons".to_string(),
                        "/docs/components/figma".to_string(),
                        "/docs/components/changelog".to_string(),
                    ],
                )
            >
                <span class="overflow-hidden inline-block h-[1.2em] leading-[1.2em]">
                    <span class=format!("{NAV_LINK_TEXT_CLASS} text-muted-foreground")>"Components"</span>
                </span>
            </Link>
            <Link href=HooksRoutes::UseCopyClipboard.to_route() class=NAV_LINK_CLASS>
                <span class="overflow-hidden inline-block h-[1.2em] leading-[1.2em]">
                    <span class=format!("{NAV_LINK_TEXT_CLASS} text-muted-foreground")>"Hooks"</span>
                </span>
            </Link>
            <Link href=RoutePaths::ICONS class=NAV_LINK_CLASS>
                <span class="overflow-hidden inline-block h-[1.2em] leading-[1.2em]">
                    <span class=format!("{NAV_LINK_TEXT_CLASS} text-muted-foreground")>"Icons"</span>
                </span>
            </Link>
            <Link href=RoutePaths::BLOCKS class=NAV_LINK_CLASS>
                <span class="overflow-hidden inline-block h-[1.2em] leading-[1.2em]">
                    <span class=format!("{NAV_LINK_TEXT_CLASS} text-muted-foreground")>"Blocks"</span>
                </span>
            </Link>
            // TODO. 🚑 Shortfix to force reload the page, small issue with SPA when navigate from Blocks to Charts using this Link. Some Charts are rendered twice in the UI...
            <Link href=RoutePaths::CHARTS force_reload=true class=NAV_LINK_CLASS>
                <span class="overflow-hidden inline-block h-[1.2em] leading-[1.2em]">
                    <span class=format!("{NAV_LINK_TEXT_CLASS} text-muted-foreground")>"Charts"</span>
                </span>
            </Link>
        // <Link
        // href=RoutePaths::WORKFLOWS
        // class="inline-flex items-center py-1.5 px-2.5 text-sm rounded-md hover:bg-accent"
        // >
        // Workflows
        // </Link>
        </div>
    }
}
