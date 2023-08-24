use async_process::{Command, Stdio};
use futures_lite::{io::BufReader, AsyncBufReadExt, StreamExt};

use tauri::Manager;

#[derive(Clone, serde::Serialize)]
struct StdOutPayload {
    message: String
}

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("process")
        .invoke_handler(tauri::generate_handler![execute, execute_and_wait])
        .build()
}

#[tauri::command]
pub async fn execute_interactive(
    window: tauri::AppHandle,
    path: String, 
    args: Vec<&str>, 
    working_dir: Option<String>
) -> Result<i32, String> {
    let mut command = Command::new(path);
    command.stdout(Stdio::piped());

    if let Some(work_dir) = working_dir {
        command.current_dir(&work_dir);
    }

    args.into_iter().for_each(|arg| { 
        command.arg(arg);
    });

    match command.spawn() {
        Ok(mut child) => {
            let mut lines = BufReader::new(child.stdout.take().unwrap()).lines();

            while let Some(line) = lines.next().await {
                if let Ok(line) = line {
                    window.emit_all("console-stdout", StdOutPayload { message: line }).unwrap();
                }
            }
            match child.output().await {
                Ok(res) => {
                    if res.status.success() {
                        Ok(0)
                    } else {
                        Ok(1)
                    }
                },
                Err(e) => Err(format!("{e}"))
            }
        },
        Err(e) => Err(format!("{e}"))
    }
    
}

#[tauri::command]
pub fn execute(path: String, args: Vec<&str>, working_dir: Option<String>) -> Result<(), String> {
    let mut command = std::process::Command::new(path);

    if let Some(work_dir) = working_dir {
        command.current_dir(&work_dir);
    }

    args.into_iter().for_each(|arg| {
        command.arg(arg);
    });

    match command.spawn() {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("{e}"))
    }
}

#[tauri::command]
pub fn execute_and_wait(path: String, args: Vec<&str>, working_dir: Option<String>) -> Result<i32, String> {
    let mut command = std::process::Command::new(path);

    if let Some(work_dir) = working_dir {
        command.current_dir(&work_dir);
    }

    args.into_iter().for_each(|arg| { 
        command.arg(arg);
    });

    match command.spawn() {
        Ok(mut x) => {
            match x.wait() {
                Ok(x) => {
                    if x.success() {
                        Ok(0)
                    } else {
                        Ok(1)
                    }
                },
                Err(e) => Err(format!("{e}"))
            }
        },
        Err(e) => Err(format!("{e}"))
    }
}