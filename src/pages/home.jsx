import React, { useState, useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";

const Home = () => {
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendImage = useMutation(api.messages.sendImage);
  const runAiCall = useAction(api.ai.chat);

  const imageInput = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  async function handleSendImage(event) {
    event.preventDefault();

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": selectedImage.type },
      body: selectedImage,
    });
    const { storageId } = await result.json();
    // Step 3: Save the newly allocated storage id to the database
    const docId = await sendImage({ storageId, author: "user_upload" });

    const jsonSchema = runAiCall({ imageId: docId });

    console.log(jsonSchema);

    setSelectedImage(null);
    imageInput.current.value = "";
  }

  return (
    <div>
      <form onSubmit={handleSendImage}>
        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          onChange={(event) => setSelectedImage(event.target.files[0])}
          disabled={selectedImage !== null}
        />
        <input
          type="submit"
          value="Send Image"
          disabled={selectedImage === null}
        />
      </form>
    </div>
  );
};

export default Home;
