package com.docket.web;

import com.docket.cartorios.CartorioService;
import com.docket.cartorios.dto.CartorioRequest;
import com.docket.cartorios.dto.CartorioResponse;
import com.docket.documentos.DocumentoService;
import com.docket.documentos.dto.DocumentoResponse;
import com.docket.shared.error.ConflictException;
import com.docket.shared.error.ResourceNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/cartorios")
@RequiredArgsConstructor
public class CartorioWebController {

    private static final List<String> STATES = List.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
            "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
            "RS", "RO", "RR", "SC", "SP", "SE", "TO");

    private final CartorioService cartorioService;
    private final DocumentoService documentoService;
    private final Validator validator;

    /**
     * Valida o request que será entregue ao service e devolve cada violação ao
     * campo correspondente do form. Os nomes dos campos são os mesmos, o que
     * mantém uma única fonte de regras de validação para API e tela.
     */
    private CartorioRequest validate(CartorioForm form, BindingResult errors) {
        CartorioRequest request = form.toRequest();
        Set<ConstraintViolation<CartorioRequest>> violations = validator.validate(request);
        for (ConstraintViolation<CartorioRequest> v : violations) {
            errors.rejectValue(v.getPropertyPath().toString(), "invalid", v.getMessage());
        }
        return request;
    }

    @ModelAttribute("states")
    public List<String> states() {
        return STATES;
    }

    @GetMapping
    public String list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String nome,
            Model model) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome"));
        Page<CartorioResponse> result = cartorioService.list(nome, pageable);
        model.addAttribute("page", result);
        model.addAttribute("nome", nome);
        return "cartorios/lista";
    }

    @GetMapping("/novo")
    public String novo(Model model) {
        model.addAttribute("cartorio", new CartorioForm());
        loadDocumentos(model);
        return "cartorios/form";
    }

    @PostMapping
    public String create(
            @ModelAttribute("cartorio") CartorioForm cartorio,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes redirectAttributes) {
        CartorioRequest request = validate(cartorio, bindingResult);
        if (bindingResult.hasErrors()) {
            loadDocumentos(model);
            return "cartorios/form";
        }
        cartorioService.create(request);
        redirectAttributes.addFlashAttribute("success", "Cartório criado com sucesso.");
        return "redirect:/cartorios";
    }

    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        CartorioResponse response = cartorioService.findById(id);
        model.addAttribute("cartorio", CartorioForm.from(response));
        model.addAttribute("cartorioId", id);
        loadDocumentos(model);
        return "cartorios/form";
    }

    @PostMapping("/{id}")
    public String update(
            @PathVariable Long id,
            @ModelAttribute("cartorio") CartorioForm cartorio,
            BindingResult bindingResult,
            Model model,
            RedirectAttributes redirectAttributes) {
        CartorioRequest request = validate(cartorio, bindingResult);
        if (bindingResult.hasErrors()) {
            model.addAttribute("cartorioId", id);
            loadDocumentos(model);
            return "cartorios/form";
        }
        cartorioService.update(id, request);
        redirectAttributes.addFlashAttribute("success", "Cartório atualizado com sucesso.");
        return "redirect:/cartorios";
    }

    @PostMapping("/{id}/excluir")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        cartorioService.delete(id);
        redirectAttributes.addFlashAttribute("success", "Cartório excluído com sucesso.");
        return "redirect:/cartorios";
    }

    @ExceptionHandler(ConflictException.class)
    public String onConflict(ConflictException ex, RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("error", ex.getMessage());
        return "redirect:/cartorios";
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String onNotFound(ResourceNotFoundException ex, Model model) {
        model.addAttribute("message", ex.getMessage());
        return "error";
    }

    private void loadDocumentos(Model model) {
        Page<DocumentoResponse> documentos =
                documentoService.list(PageRequest.of(0, 100, Sort.by("nome")));
        model.addAttribute("documentos", documentos.getContent());
    }
}
