$('#vaultTable').on('click', '.btn-getdrive', function() {
  listFiles($(this).attr('data-drive'));
});

$('#vaultTable').on('click', '.btn-up', function(el) {
  tempDrive = $(el.target).data('drive');
  $('#driveID').val(tempDrive);
  $('#upload-input').click();
});

$('#vaultTable').on('click', '.btn-trash', function() {
  tempDrive = $(this).closest('tr').children('.driveid').text();
  console.log("Deleting drive: " + tempDrive);
  deleteVault(tempDrive);
});

$('#fileTable').on( 'click', 'button.download', function () {
  downloadFile($(this).attr('data-drive'), $(this).attr('data-filename'), $(this).attr('data-id'), $(this).attr('data-mime'));
});

function downloadFile(containerID, filename, fileID, fileMime) {

  var data = {};
  data.driveID = containerID;
  data.fileID = fileID;
  data.fileNAME = filename;
  data.MIME = fileMime;

  console.log(data);

  $.ajax({
    method: 'POST',
    /* /list/:id/download/:name/:fileid/mime/:mime */
    url: '/vault/download/file',
    data: JSON.stringify(data),
    contentType:  'application/json',
    processData: false
  }).done(function(response) {

    if (response.status === 'fail') {
      // Error handling
      console.error(response.message, 'Error occured!')
    }
    if (response.status === 'success') {
      // Error handling
      console.log(response.message, 'Success!');
      //window.location = '/dev/download/' + response.tmp + '/' + filename ;

    }
  })
}

$('#upload-input').on('change', function(){
  var files = $(this).get(0).files;
  var drive = $(this).closest('tr').children('.driveid').text();
  $('#driveID').val(tempDrive);

  var files = $(this).get(0).files;
  if (files.length > 0) {
      var formData = new FormData();

      for (var i = 0; i < files.length; i++) {
          var file = files[i];
          //formData.append('pictures', file, file.name);
          formData.append('uploads', file, file.name);
          formData.append('driveID', tempDrive);
      }

      $.ajax({
          url          : '/vault/upload',
          type         : 'POST',
          data         : formData,
          processData  : false,
          contentType  : false,
          success      : function (links) {
            location.reload();
          }
      });
  }

});


listDrives();

function listDrives() {
  $.ajax({
    method: 'GET',
    url: '/vault'
  }).done(function(buckets) {
    if (buckets.status === 'fail') {
      alert('Some error happened');
    }
    if (buckets.status === 'empty') {
      alert('Server error: ' + buckets.message);
      $('.addVault').css('display', 'block');
    }
    if (buckets.status === 'success') {
      var table = $("#vaultTable");
      table.empty();
      table.append("<thead><tr><td>Vault name</td><td>Vault ID</td><td class=\"text-right\">Actions</td></tr>");
      table.append("<tbody>");

      buckets.result.forEach(function(bucket) {
        if (!bucket.decrypted) alert('Ooopsq its locked!');
        console.log(bucket.name);

        table.append("<tr valign='middle'><td><strong>" + bucket.name + "</strong></td><td class='driveid'>" + bucket.id + "</td><td class=\"text-right\"> " +
          "<button class='btn btn-outline-primary btn-sm mb-1 btn-getdrive' data-drive='" + bucket.id + "'>View contents</button> " +
          "<button class='btn btn-outline-primary btn-sm mb-1 btn-up' data-drive='" + bucket.id + "'>Add files</button> " +
          "<button class='btn btn-primary btn-sm mb-1 btn-inherit-drive'>Inherit</button> " +
          "<button class='btn btn-danger btn-sm mb-1 btn-trash'><i class='fa fa-trash-o' aria-hidden='true'></i></button> " +
          "</td></tr>");
      });
      table.append("</tbody>");
    }
  })
}

function listFiles(driveID) {
  var data = {};
  var fileSize = 0;
  data.vaultID = driveID;
  data.msg = 'none';

  console.log('requesting drive ' + driveID);
  //$('.refresh-files').attr('data-drive', driveID);
  $.ajax({
    method: 'POST',
    url: '/vault/list',
    data: JSON.stringify(data),
    contentType: 'application/json',
    processData: false
  }).done(function(bucketsWithFiles) {
    if (bucketsWithFiles.status === 'fail') {
      console.error(bucketsWithFiles.message, 'Error occured!')
    }
    if (bucketsWithFiles.status === 'success') {

      var table = $("#fileTable");
      table.empty();

      table.append("<thead><tr><td>Filename</td><td>MIME</td><td class=\"text-right\">Action</td></tr>");
      table.append("<tbody>");

      bucketsWithFiles.result.reverse().forEach(function(file) {
        //console.log(bucket);
        console.log('ye' + data.driveID);
        var currentDrive = data.driveID;
        table.append("<tr><td class='filenames'><strong>" + file.filename + "</strong></td><td>" + file.filename.split('.').pop() + "</td> " +
          "<td class=\"text-right\"><button class='btn btn-success download text-white btn-sm' data-mime='" + file.filename.split('.').pop() + "' data-id='" + file.id + "' data-drive='" + data.vaultID + "' data-filename='" + file.filename + "'> " +
          "<i class='fa fa-download' aria-hidden='true'></i></button> " +
          "<button class='btn btn-danger text-white btn-sm' onClick='deleteFile(this);' data-id='" + file.id + "' data-drive='" + data.driveID + "'> " +
          "<i class='fa fa-trash' aria-hidden='true'></i></button></td> " +
          "</tr>");
        fileSize += file.size;
      });
      table.append("</tbody>");
    }
  })
}

function deleteVault(vaultID) {
  var data = {};
  data.vaultID = vaultID;

  $.ajax({
    method: 'POST',
    url: '/vault/delete',
    data: JSON.stringify(data),
    contentType: 'application/json',
    processData: false
  }).done(function(response) {

    if (response.status === 'fail') {
      // Error handling
      console.error(response.message, 'Error occured!')
    }
    if (response.status === 'success') {
      // Error handling
      console.log(response.message, 'Success!');
      location.reload();

    }
  })
}

$("#addVault").submit(function(e) {
  e.preventDefault();

  var data = {};
  data.vaultName = $('#vaultName').val();

  $.ajax({
    method: 'POST',
    url: '/vault/create',
    data: JSON.stringify(data),
    contentType: 'application/json',
    processData: false
  }).done(function(response) {
    if (response.status === 'fail') {
      console.error(response.message, 'Error occured!')
    }
    if (response.status === 'success') {
      console.log(response.message)
      $('.addVault').css('display', 'none');
      location.reload();
    }
  });

});
