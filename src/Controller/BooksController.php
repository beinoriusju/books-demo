<?php
// src/Controller/LuckyController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Book;
use App\Repository\BookRepository;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\JsonResponse;

#[Route('/books')]
#[IsGranted('ROLE_USER')]
class BooksController extends AbstractController
{
    #[Route('', name: 'book_index', methods: ['GET'])]
    public function index(Request $request, BookRepository $bookRepository): Response
    {
        // Check if AJAX request and user is not authenticated
        if ($request->isXmlHttpRequest() && !$this->getUser()) {
            return new JsonResponse([
                'error' => 'Authentication required',
                'redirect' => $this->generateUrl('app_login')
            ], 401);
        }

        $page = $request->query->getInt('page', 1);
        $query = $request->query->get('query', '');
        $limit = $request->query->get('limit', 5);
        $sort = $request->query->get('sort', 'createdAt');
        $order = $request->query->get('order', 'DESC');

        $filter = [
            'query' => $query,
            'page' => $page,
            'limit' => $limit,
            'sort' => $sort,
            'order' => $order,
        ];

        $result = $bookRepository->searchBooks($filter);

        if ($request->isXmlHttpRequest()) {
            return $this->render('books/_list.html.twig', [
                'books' => $result['books'],
                'filter' => $filter,
                'currentPage' => $page,
                'totalPages' => $result['totalPages']
            ]);
        }

        return $this->render('books/index.html.twig', [
            'books' => $result['books'],
            'filter' => $filter,
            'currentPage' => $page,
            'totalPages' => $result['totalPages']
        ]);
    }

    #[Route('/{id}/show', name: 'book_show', methods: ['GET'])]
    public function show(int $id, BookRepository $bookRepository): Response
    {
        $book = $bookRepository->find($id);

        if (!$book) {
            throw $this->createNotFoundException('Book not found');
        }

        return $this->render('books/book.html.twig', [
            'book' => $book,
        ]);
    }

    #[Route('/{id}/delete', name: 'book_delete', methods: ['GET', 'POST'])]
    public function delete(int $id, Request $request, BookRepository $bookRepository, EntityManagerInterface $entityManager): Response
    {
        $book = $bookRepository->find($id);

        if (!$book) {
            throw $this->createNotFoundException('Book not found');
        }

        if ($request->isMethod('POST')) {
            $bookTitle = $book->getTitle(); // Store title before deletion
            $entityManager->remove($book);
            $entityManager->flush();

            $this->addFlash('success', sprintf('Book "%s" has been successfully deleted.', $bookTitle));

            return $this->redirectToRoute('book_index');
        }

        return $this->render('books/delete.html.twig', [
            'book' => $book,
        ]);
    }

    #[Route('/{id}/edit', name: 'book_edit', methods: ['GET'])]
    public function edit(int $id, BookRepository $bookRepository): Response
    {
        $book = $bookRepository->find($id);

        if (!$book) {
            throw $this->createNotFoundException('Book not found');
        }

        // Serialize book entity to array for React component
        $bookData = [
            'id' => $book->getId(),
            'title' => $book->getTitle(),
            'author' => $book->getAuthor(),
            'isbn' => $book->getIsbn(),
            'publicationDate' => $book->getPublicationDate()?->format('Y-m-d'),
            'genre' => $book->getGenre(),
            'numberOfCopies' => $book->getNumberOfCopies(),
        ];

        return $this->render('books/edit.html.twig', [
            'id' => $id,
            'book' => $bookData,
        ]);
    }

    #[Route('/new', name: 'book_new', methods: ['GET'])]
    public function new(): Response
    {
        return $this->render('books/new.html.twig', [
            'book' => null
        ]);
    }
}