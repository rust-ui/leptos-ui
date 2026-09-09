---
title: "Demo Stepper Vertical"
name: "demo_stepper_vertical"
cargo_dependencies: []
registry_dependencies: ["stepper"]
type: "components:demos"
path: "demos/demo_stepper_vertical.rs"
---

# Demo Stepper Vertical

This component demo demonstrates practical implementation patterns and provides a concrete usage example for LLMs to understand the code structure and functionality.

## Installation

To add this component demo in your app, run:

```bash
# cargo install ui-cli --force
ui add demo_stepper_vertical
```

## Component Code

```rust
use leptos::prelude::*;

use crate::components::ui::stepper::{
    Stepper, StepperDescription, StepperIndicator, StepperItem, StepperOrientation, StepperSeparator, StepperTitle,
    StepperTrigger,
};

#[component]
pub fn DemoStepperVertical() -> impl IntoView {
    view! {
        <Stepper total_steps=3 default_step=1 orientation=StepperOrientation::Vertical class="w-full max-w-xs">
            <StepperItem step=0>
                <StepperTrigger>
                    <StepperIndicator />
                    <div class="flex flex-col gap-0.5">
                        <StepperTitle>"Account"</StepperTitle>
                        <StepperDescription>"Create your account"</StepperDescription>
                    </div>
                </StepperTrigger>
                <StepperSeparator />
            </StepperItem>
            <StepperItem step=1>
                <StepperTrigger>
                    <StepperIndicator />
                    <div class="flex flex-col gap-0.5">
                        <StepperTitle>"Profile"</StepperTitle>
                        <StepperDescription>"Complete your profile"</StepperDescription>
                    </div>
                </StepperTrigger>
                <StepperSeparator />
            </StepperItem>
            <StepperItem step=2>
                <StepperTrigger>
                    <StepperIndicator />
                    <div class="flex flex-col gap-0.5">
                        <StepperTitle>"Confirmation"</StepperTitle>
                        <StepperDescription>"Review and confirm"</StepperDescription>
                    </div>
                </StepperTrigger>
            </StepperItem>
        </Stepper>
    }
}
```
