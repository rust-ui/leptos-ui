use leptos::prelude::*;

use crate::ui::drag_and_drop::{Draggable, DraggableItem, DraggableZone};

#[component]
pub fn DemoDragAndDrop() -> impl IntoView {
    view! {
        <Draggable class="max-w-2xl">
            <DraggableZone>
                <DraggableItem text="1" />
                <DraggableItem text="2" />
            </DraggableZone>
            <DraggableZone>
                <DraggableItem text="3" />
                <DraggableItem text="4" />
            </DraggableZone>
        </Draggable>
    }
}
