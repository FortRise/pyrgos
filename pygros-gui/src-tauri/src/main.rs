// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;

use std::sync::RwLock;


fn main() {
    let mut builder = tauri::Builder::default();
    builder = builder
        .manage(api::client::AppState(RwLock::new(api::client::InnerAppState { tf_dirs: Vec::new() })));
    
    let builder = builder
        .plugin(api::client::init())
        .plugin(api::fix_fs::init())
        .plugin(api::process::init())
        .plugin(tauri_plugin_upload::init())
        .invoke_handler(tauri::generate_handler![api::process::execute_interactive]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
