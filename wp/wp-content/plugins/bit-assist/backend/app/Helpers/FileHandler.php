<?php

namespace BitApps\Assist\Helpers;

use BitApps\Assist\Config;

final class FileHandler
{
    public function moveUploadedFiles($fileDetails, $widgetChannelID)
    {
        $_upload_dir = Config::get('UPLOAD_DIR') . DIRECTORY_SEPARATOR . $widgetChannelID;
        wp_mkdir_p($_upload_dir);
        $file_uploaded = [];

        if (is_array($fileDetails['name'])) {
            foreach ($fileDetails['name'] as $key => $fileName) {
                $fileData = $this->saveFile($_upload_dir, $fileDetails['tmp_name'][$key], $fileName);
                if ($fileData) {
                    $file_uploaded[$key] = $fileData;
                }
            }
        } else {
            $fileData = $this->saveFile($_upload_dir, $fileDetails['tmp_name'], $fileDetails['name']);
            if ($fileData) {
                $file_uploaded[0] = $fileData;
            }
        }

        return $file_uploaded;
    }

    private function saveFile($_upload_dir, $tmpName, $fileName)
    {
        if (empty($fileName)) {
            return false;
        }

        $uniqueFileName = wp_generate_uuid4();
        $file_uploaded = ['uniqueName' => $uniqueFileName, 'originalName' => $fileName];

        $move_status = \move_uploaded_file($tmpName, $_upload_dir . DIRECTORY_SEPARATOR . $uniqueFileName);
        if (!$move_status) {
            return false;
        }
        return $file_uploaded;
    }

    public function deleteFiles($widgetChannelID, $files)
    {
        $_upload_dir = Config::get('UPLOAD_DIR') . DIRECTORY_SEPARATOR . $widgetChannelID;
        foreach ($files as $name) {
            unlink($_upload_dir . DIRECTORY_SEPARATOR . $name);
        }
    }
}
