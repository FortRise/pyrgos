use std::sync::RwLock;


#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct InnerAppState {
    pub tf_dirs: Vec<TFDir>
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct TFDir {
    pub name: String,
    pub path: String,
    pub tf_type: i8
}

pub struct AppState(pub RwLock<InnerAppState>);

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("client")
        .invoke_handler(tauri::generate_handler![change_state, save, load, add_tf_path, remove_tf_path, get_tf_path])
        .build()
}

#[tauri::command]
fn change_state(app_state: tauri::State<AppState>, path: String, state: i8) -> Result<(), String> {
    if let Ok(mut guard) = app_state.0.write() {
        for dir in &mut guard.tf_dirs {
            if dir.path == path {
                dir.tf_type = state;
                return Ok(());
            }
        }
        Err(format!("Path: {path} not found"))
    }
    else {
        Err("Failed to read state.".into())
    }
}

#[tauri::command]
fn save(state: tauri::State<AppState>, path: String) -> Result<(), String> {
    if let Ok(guard) = state.0.read() {
        match serde_json::ser::to_string_pretty(&*guard) {
            Ok(x) => {
                match std::fs::write(&path, x) {
                    Ok(()) => Ok(()),
                    Err(e) => Err(format!("{e}"))
                }
            },
            Err(e) => Err(format!("{e}"))
        }
    } else {
        Err("Failed to read state.".into())
    }
}

#[tauri::command]
fn load(state: tauri::State<AppState>, path: String) -> Result<InnerAppState, String> {
    if let Ok(mut guard) = state.0.write() {
        match std::fs::read_to_string(&path) {
            Ok(json) => {
                match serde_json::de::from_str::<InnerAppState>(&json) {
                    Ok(x) => {
                        *guard = x;
                        Ok(guard.clone())
                    },
                    Err(e) => Err(format!("{e}"))
                }
            },
            Err(e) => Err(format!("{e}"))
        }
    } else {
        Err("Failed to read state.".into())
    }
}


#[tauri::command]
fn add_tf_path(state: tauri::State<AppState>, name: String, path: String, tf_type: i8) {
    if let Ok(mut guard) = state.0.write() {
        guard.tf_dirs.push(TFDir {
            name, path, tf_type
        });
    }
}

#[tauri::command]
fn remove_tf_path(state: tauri::State<AppState>, path: String) {
    if let Ok(mut guard) = state.0.write() {
        guard.tf_dirs.retain(|x| x.path != path);
    }
}

#[tauri::command]
fn get_tf_path(state: tauri::State<AppState>) -> Result<Vec<TFDir>, String> {
    if let Ok(guard) = state.0.read() {
        Ok(guard.tf_dirs.clone())
    }
    else {
        Err("Failed to read state.".into())
    }
}
