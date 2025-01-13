<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $targetDir = __DIR__ . '/uploads/contrats/';
    $targetFile = $targetDir . basename($_FILES['file']['name']);
    $baseUrl = 'https://backthecoastusa.committeam.com/uploads/contrats/'; // Changez l'URL selon vos besoins

    // Créer le dossier s'il n'existe pas
    if (!file_exists($targetDir)) {
        if (!mkdir($targetDir, 0777, true)) {
            echo json_encode(['status' => 'error', 'message' => 'Impossible de créer le dossier cible']);
            exit;
        }
    }

    // Vérifiez si le fichier est téléchargé correctement
    if (is_uploaded_file($_FILES['file']['tmp_name'])) {
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Fichier téléchargé avec succès',
                'filePath' => $baseUrl . basename($_FILES['file']['name']), // Ajoutez l'URL complète
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors du déplacement du fichier']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Le fichier n\'a pas été téléchargé correctement']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Requête invalide ou aucun fichier reçu']);
}
