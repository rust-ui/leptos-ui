use icons::{GitBranch, Search};
use leptos::prelude::*;

use crate::ui::marker::{Marker, MarkerContent, MarkerIcon, MarkerVariant};
use crate::ui::spinner::Spinner;

#[component]
pub fn DemoMarker() -> impl IntoView {
    view! {
        <div class="flex flex-col gap-8 py-12 w-full max-w-sm">
            <Marker>
                <MarkerIcon>
                    <GitBranch />
                </MarkerIcon>
                <MarkerContent>"Switched to a new branch"</MarkerContent>
            </Marker>
            <Marker role="status">
                <MarkerIcon>
                    <Spinner />
                </MarkerIcon>
                <MarkerContent class="shimmer">"Thinking..."</MarkerContent>
            </Marker>
            <Marker variant=MarkerVariant::Separator>
                <MarkerContent>"Conversation compacted"</MarkerContent>
            </Marker>
            <Marker>
                <MarkerIcon>
                    <Search />
                </MarkerIcon>
                <MarkerContent>"Explored 4 files"</MarkerContent>
            </Marker>
        </div>
    }
}
