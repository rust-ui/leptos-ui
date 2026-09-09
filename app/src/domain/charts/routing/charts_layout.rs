use app_components::FooterLayout;
use app_config::SiteConfig;
use leptos::prelude::*;
use leptos_meta::Title;
use leptos_router::components::Outlet;
use leptos_router::hooks::use_location;

use crate::components::navigation::header_docs::HeaderDocs;
use crate::domain::charts::components::charts_hero::ChartsHero;
use crate::utils::page_transition::{PAGE_OUTLET, retrigger_page_fade};

#[component]
pub fn ChartsLayout() -> impl IntoView {
    let title = format!("Leptos Charts & Graphs · Rust UI Components | {}", SiteConfig::TITLE);
    let location = use_location();

    Effect::new(move |prev: Option<()>| {
        let _ = location.pathname.get();
        if prev.is_some() {
            retrigger_page_fade();
        }
    });

    view! {
        <Title text=title />
        // Load ApexCharts only on chart pages for performance optimization
        <script id="apexcharts-cdn" defer src="/cdn/apexcharts.5.3.6.min.js"></script>
        <script id="chart-init-script" defer src="/app_components/chart_init.js?v=2"></script>

        <HeaderDocs />

        <div data-name="__ChartsLayout" class="container flex flex-col gap-10">
            <ChartsHero />

            <div id=PAGE_OUTLET class="page__fade">
                <Outlet />
            </div>
        </div>

        <FooterLayout />
    }
}
