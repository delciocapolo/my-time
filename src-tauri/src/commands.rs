use tauri::Window;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
pub fn minimize_window(window: Window) {
    window.minimize().unwrap();
}

#[tauri::command]
pub fn maximize_window(window: Window) {
    window.maximize().unwrap();
}

#[tauri::command]
pub fn close_window(window: Window) {
    window.close().unwrap();
}
