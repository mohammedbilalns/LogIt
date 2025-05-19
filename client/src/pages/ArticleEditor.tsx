import { useParams, useNavigate } from 'react-router-dom';
import ArticleEditorForm from '../components/ArticleEditorForm';

interface ArticleEditorProps {
  mode: 'create' | 'edit';
}

export default function ArticleEditor({ mode }: ArticleEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/articles');
  };

  return (
    <ArticleEditorForm
      mode={mode}
      articleId={id}
      onClose={handleClose}
    />
  );
} 