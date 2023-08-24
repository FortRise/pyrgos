pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("fix_fs")
        .invoke_handler(tauri::generate_handler![open, extract])
        .build()
}

#[tauri::command]
fn extract(path: String, out_path: String) {
    let path = std::path::Path::new(&path);
    if let Ok(file) = std::fs::File::open(path) {
        if let Ok(mut archive) = zip::ZipArchive::new(file) {

            for i in 0..archive.len() {
                let Ok(mut file) = archive.by_index(i) else { continue };
                let outpath = match file.enclosed_name() {
                    Some(path) => {
                        std::path::Path::new(&out_path).join(path.to_owned())
                    },
                    None => continue
                };

                if (*file.name()).ends_with('/') {
                    println!("File {} extracted to \"{}\"", i, outpath.display());
                    std::fs::create_dir_all(&outpath).unwrap();
                } else {
                    println!(
                        "File {} extracted to \"{}\" ({} bytes)",
                        i,
                        outpath.display(),
                        file.size()
                    );

                    if let Some(p) = outpath.parent() {
                        if !p.exists() {
                            std::fs::create_dir_all(p).unwrap();
                        }
                    }
                    let mut outfile = std::fs::File::create(&outpath).unwrap();
                    std::io::copy(&mut file, &mut outfile).unwrap();
                }

                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;

                    if let Some(mode) = file.unix_mode() {
                        std::fs::set_permissions(&outpath, std::fs::Permissions::from_mode(mode)).unwrap();
                    }
                }
            }
        }
    }

}

#[tauri::command]
fn open(path: String) -> Result<(), String> {
    match opener::reveal(&path) {
        Ok(()) => Ok(()),
        Err(_) => Err(format!("Failed to open path: {path}"))
    }
}